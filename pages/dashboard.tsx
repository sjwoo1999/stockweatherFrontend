// stockweather-frontend/src/pages/dashboard.tsx

import React, { useEffect, useState, useCallback, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import { SocketContext } from '../pages/_app'; // _app.tsx에서 정의한 Context를 임포트

// User 인터페이스 (기존 그대로 사용)
interface User {
  id: number;
  kakaoId: string;
  email?: string;
  nickname: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const router = useRouter();

    // SocketContext에서 소켓 정보 가져오기
    const { socket, socketId, socketConnected } = useContext(SocketContext);

    // 로그아웃 함수 (useCallback으로 래핑하여 의존성 문제 해결)
    const handleLogout = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('jwtToken');
            const KAKAO_LOGOUT_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_LOGOUT_REDIRECT_URI || 'http://localhost:3001/login';
            const KAKAO_AUTH_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&logout_redirect_uri=${encodeURIComponent(KAKAO_LOGOUT_REDIRECT_URI)}`;

            window.location.href = KAKAO_AUTH_LOGOUT_URL;
        }
    }, []); // 의존성 없음

    // 사용자 프로필 및 최근 검색어 불러오는 함수 (useCallback으로 래핑)
    const fetchUserProfileAndRecentSearches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. 사용자 프로필 불러오기
            console.log('Fetching user profile...');
            const userResponse = await axiosInstance.get<User>('/users/me');
            console.log('User profile API response data:', userResponse.data);
            setUser(userResponse.data);
            console.log('User profile set:', userResponse.data.nickname);

            // 2. 최근 검색어 불러오기 (JSON.parse 에러 핸들링 강화)
            const storedSearches = localStorage.getItem('recentSearches');
            console.log('Raw recent searches from localStorage:', storedSearches); // 로컬 스토리지에서 가져온 원본 데이터 로깅

            if (storedSearches) {
                try {
                    const parsedSearches = JSON.parse(storedSearches);
                    // 배열인지 확인하는 추가적인 검사
                    if (Array.isArray(parsedSearches)) {
                        setRecentSearches(parsedSearches);
                        console.log('Parsed recent searches from localStorage:', parsedSearches);
                    } else {
                        console.warn('LocalStorage "recentSearches" is not an array. Clearing it.');
                        setRecentSearches([]);
                        localStorage.removeItem('recentSearches'); // 비정상적인 데이터 제거
                    }
                } catch (parseError) {
                    console.error('Failed to parse recent searches from localStorage:', parseError);
                    // 파싱 실패 시 해당 데이터를 무시하고 초기화
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches'); // 잘못된 데이터 제거
                    setError('최근 검색 기록을 불러오는 중 오류가 발생했습니다. 기록이 초기화됩니다.'); // 사용자에게 알림
                }
            } else {
                setRecentSearches([]); // 저장된 검색어가 없으면 빈 배열로 초기화
                console.log('No recent searches found in localStorage.');
            }
        } catch (err) {
            console.error('Fetch user profile or recent searches error:', err);
            if (axios.isAxiosError(err)) {
                console.error('Axios error response (from fetchUserProfileAndRecentSearches):', err.response);
                if (err.response?.status === 401) {
                    console.log("401 에러 발생: 토큰 만료 또는 유효하지 않음. 강제 로그아웃 처리.");
                    handleLogout(); // 로그아웃 함수 호출
                } else {
                    setError(err.response?.data?.message || err.message);
                }
            } else {
                // Axios 에러가 아닌 경우의 일반적인 에러 처리
                console.error('Non-Axios error during data fetch:', err);
                setError('사용자 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [handleLogout]); // handleLogout이 useCallback으로 래핑되었으므로 의존성 배열에 추가

    // 사용자 정보 로딩을 처리하는 useEffect
    useEffect(() => {
        // 클라이언트 사이드에서만 실행
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setLoading(false);
            router.replace('/login');
            return;
        }

        // 사용자 프로필 및 최근 검색어 불러오기
        fetchUserProfileAndRecentSearches();

        return () => {
            // Cleanup functions specific to Dashboard if any, but not socket related.
        };
    }, [router, fetchUserProfileAndRecentSearches]); // 의존성 배열에 router, fetchUserProfileAndRecentSearches 추가

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }

        if (!socket || !socketConnected || !socketId) {
            setError('서버와 실시간 연결이 불안정합니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setError(null);
        const query = searchTerm.trim();
        const currentSocketId = socketId;

        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
            }

            console.log(`Sending search request for "${query}" with socketId: ${currentSocketId}`);
            await axiosInstance.post(
                '/api/search',
                {
                    query: query,
                    socketId: currentSocketId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(`HTTP search request sent for "${query}". Redirecting to /stock-result...`);

            // 검색 성공 시 최근 검색어 업데이트
            const updatedRecentSearches = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5); // 최대 5개 유지
            setRecentSearches(updatedRecentSearches);
            localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches)); // 로컬 스토리지에 저장

            router.push(`/stock-result?query=${encodeURIComponent(query)}&socketId=${currentSocketId}`);

        } catch (err) {
            console.error('Error sending search request from Dashboard:', err);
            if (axios.isAxiosError(err)) {
                console.error('Axios error response (from handleSearch):', err.response);
                if (err.response?.status === 401) {
                    setError('세션이 만료되었습니다. 다시 로그인해주세요.');
                    handleLogout();
                } else {
                    setError(`검색 요청 실패: ${err.response?.data?.message || err.message}`);
                }
            } else {
                console.error('Non-Axios error during search request:', err);
                setError(`검색 요청 중 알 수 없는 오류가 발생했습니다: ${err}`);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRecentSearchClick = (stockName: string) => {
        setSearchTerm(stockName);
        handleSearch();
    };

    // 로딩 및 에러 UI
    if (loading) {
        return (
            <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
                <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
                    <p className="mb-4 text-sm text-text-muted font-body">
                        사용자 정보를 불러오는 중입니다...
                    </p>
                    <div className="spinner">
                        {[...Array(8)].map((_, i) => (
                            <span key={i}></span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
                <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
                    <p className="mb-4 text-sm text-red-500 font-body">
                        오류: {error}
                    </p>
                    <button
                        onClick={() => router.replace('/login')}
                        className="mt-4 bg-surface-subtle text-text-default px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-surface-subtle/70 transition-colors duration-200 font-body"
                    >
                        로그인 페이지로
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
                <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
                    <p className="mb-4 text-sm text-text-muted font-body">
                        사용자 정보를 가져올 수 없습니다.
                    </p>
                    <button
                        onClick={() => router.replace('/login')}
                        className="mt-4 bg-surface-subtle text-text-default px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-surface-subtle/70 transition-colors duration-200 font-body"
                    >
                        로그인 페이지로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light flex flex-col items-center py-12">
            <Head>
                <title>대시보드 - StockWeather</title>
            </Head>

            <div className="w-full max-w-md bg-surface-base flex flex-col justify-start px-8 py-10 shadow-lg rounded-xl">

                {/* 프로필 이미지 및 환영 메시지 */}
                <div className="mb-8 text-center">
                    {user?.profileImage && (
                        <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-2 border-surface-subtle shadow-md">
                            <Image
                                src={user.profileImage}
                                alt="프로필 이미지"
                                width={112}
                                height={112}
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                    console.error("Error loading profile image:", e);
                                    // 이미지 로드 실패 시 대체 이미지 또는 아무것도 표시하지 않음
                                    e.currentTarget.src = '/default-profile.png'; // 예시: 기본 이미지 경로
                                }}
                            />
                        </div>
                    )}
                    <h1 className="text-2xl font-heading mb-2 text-brand-dark">
                        환영합니다, <span className="text-brand-primary">{user?.nickname || '이름 없음'}</span>님!
                    </h1>
                </div>

                {/* 섹션 제목 */}
                <h2 className="text-center font-heading text-xl mb-6 text-brand-dark">
                    어떤 종목에 대한 정보를 원하시나요?
                </h2>

                {/* 검색 입력창 디자인 */}
                <div className="flex items-center bg-surface-subtle px-4 py-2 rounded-full shadow-sm w-full mb-8">
                    <FaSearch className="text-brand-primary mr-3 text-xl" />
                    <input
                        type="text"
                        placeholder="예: 삼성전자"
                        className="text-text-default flex-1 text-base bg-transparent outline-none placeholder-text-muted font-body"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        onClick={handleSearch}
                        className="ml-3 bg-brand-primary text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-brand-primary/90 transition-colors duration-200"
                        aria-label="검색"
                    >
                        <FaArrowRight size={18} />
                    </button>
                </div>

                {/* 최근 검색 종목 섹션 */}
                <div className="mt-8 flex-grow">
                    <h3 className="text-lg font-heading text-brand-dark mb-4 border-b border-surface-subtle pb-2">최근 검색 종목</h3>
                    <ul className="space-y-3">
                        {recentSearches.length > 0 ? (
                            recentSearches.map((item, index) => (
                                <li
                                    key={index}
                                    className="py-3 px-4 bg-surface-base rounded-md shadow-sm border border-surface-subtle hover:bg-brand-light cursor-pointer transition-colors duration-200 flex justify-between items-center font-body text-text-default"
                                    onClick={() => handleRecentSearchClick(item)}
                                >
                                    <span>{item}</span>
                                    <FaArrowRight className="text-brand-primary text-sm" />
                                </li>
                            ))
                        ) : (
                            <li className="text-center text-text-muted font-body py-4">최근 검색 기록이 없습니다.</li>
                        )}
                    </ul>
                </div>

                {/* 로그아웃 버튼 */}
                <button
                    onClick={handleLogout}
                    className="w-full mt-8 py-3 rounded-md text-base font-body bg-surface-subtle text-red-500 hover:bg-red-500/10 transition-colors duration-200 shadow-md"
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
}

export default DashboardPage;