// stockweather-frontend/src/pages/profile.tsx (수정된 부분)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../api/axiosInstance'; // axiosInstance 임포트
import ProtectedRoute from '../components/ProtectedRoute'; // 필요시

// ... (UserProfile 인터페이스는 그대로 유지)

function ProfilePage() {
  // ... (useState, router 등 기존 코드 유지)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('jwtToken'); // axiosInstance에 인터셉터가 있어도 로컬 스토리지 확인은 필요

        if (!token) {
          // 토큰이 없으면 ProtectedRoute가 처리하거나, 여기서 직접 리다이렉트
          router.replace('/login');
          return;
        }

        console.log('ProfilePage: Fetching user profile...');

        // axiosInstance 사용
        const response = await axiosInstance.get<UserProfile>('/users/me'); // baseURL이 설정되어 있으므로 상대 경로 사용
        setUserProfile(response.data);
        console.log('ProfilePage: User profile fetched successfully:', response.data);

      } catch (err) {
        console.error('ProfilePage: Error fetching user profile:', err);
        // axiosInstance의 응답 인터셉터가 401 Unauthorized를 처리하므로
        // 여기서는 다른 타입의 에러에 집중할 수 있습니다.
        if (axios.isAxiosError(err) && err.response) {
          // 401은 이미 인터셉터에서 리다이렉트했으므로 여기서는 도달하지 않을 가능성이 높음
          if (err.response.status === 404) {
            setError('사용자 프로필을 찾을 수 없습니다.');
          } else {
            setError(`프로필 정보를 가져오는데 실패했습니다: ${err.response.statusText}`);
          }
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // ... (로딩, 에러, 프로필 표시 UI는 기존 코드 유지)

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>내 프로필</h1>
      <div style={{ marginBottom: '15px' }}>
        <img
          src={userProfile.profileImage || '/images/default_profile.png'}
          alt="프로필 이미지"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>
      <p><strong>ID:</strong> {userProfile.id}</p> {/* ID도 추가 */}
      <p><strong>닉네임:</strong> {userProfile.nickname}</p>
      <p><strong>이메일:</strong> {userProfile.email}</p>
      <p><strong>카카오 ID:</strong> {userProfile.kakaoId}</p>
      <p><strong>가입일:</strong> {new Date(userProfile.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

export default ProfilePage;