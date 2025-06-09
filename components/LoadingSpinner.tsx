// src/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  currentStep?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'AI가 삼성전자의 공시 데이터를 분석 중입니다.',
  currentStep = '분석 준비 중...',
}) => {
  // 스피너가 최종적으로 보이길 원하는 크기를 여기에서 직접 설정합니다.
  const desiredSpinnerDisplaySize = 50; // 원하는 최종 크기를 50px로 조정 (더 작게 보려면 더 줄일 수 있습니다.)

  // Set4 원본 애니메이션은 180px x 180px 기준으로 디자인되었습니다.
  const originalSet4Size = 180;
  const originalLiquidSize = 50; // liquid 요소의 원본 크기

  // 원본 애니메이션을 desiredSpinnerDisplaySize에 맞춰 얼마나 축소해야 하는지 계산
  const scaleFactor = desiredSpinnerDisplaySize / originalSet4Size;

  // 필터 강도를 스케일 팩터에 비례하여 더욱 미세하게 조절하거나,
  // 뭉침 현상을 없애기 위해 매우 작은 값으로 설정합니다.
  // 스피너가 더 작아졌으므로, stdDeviation을 더 줄여야 합니다.
  // 이 값들은 시각적으로 조절이 필요할 수 있습니다.
  const adjustedStdDeviation = 5 * scaleFactor; // 5 * (50/180) = 약 1.38
  const feColorMatrixValueM44 = 15; // 뭉침 효과를 조절하는 값 (20 근처에서 더 뭉침)
  const feColorMatrixValueM45 = -7; // 뭉침 효과 오프셋 (음수 값일수록 뭉침)

  // liquid 요소의 크기를 desiredSpinnerDisplaySize에 비례하여 계산
  const liquidSize = originalLiquidSize * scaleFactor; // 예: 50 * (50/180) = 약 13.88px

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-85 z-50">
      {/* 팝업 창 크기 조절 (Tailwind 클래스로 조절) */}
      <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl max-w-sm text-center">
        {/* 중앙 애니메이션 영역 */}
        <div
          className="relative mb-6"
          style={{
            width: `${desiredSpinnerDisplaySize}px`, // 스피너 컨테이너 크기
            height: `${desiredSpinnerDisplaySize}px`, // 스피너 컨테이너 크기
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* SVG filter for gooey effect */}
          <svg className="svg">
            <filter id="gooey">
              {/* stdDeviation 값을 계산된 adjustedStdDeviation로 적용 */}
              <feGaussianBlur stdDeviation={`${adjustedStdDeviation}`} in="SourceGraphic"></feGaussianBlur>
              <feColorMatrix
                values={`1 0 0 0 0
                         0 1 0 0 0
                         0 0 1 0 0
                         0 0 0 ${feColorMatrixValueM44} ${feColorMatrixValueM45}`} // 조정된 값을 적용
              ></feColorMatrix>
            </filter>
          </svg>

          {/* Liquid Animation */}
          {/* transform: scale() 대신 직접 width/height를 설정 */}
          <div className="loading-content">
            <div className="liquid"></div>
            <div className="liquid"></div>
            <div className="liquid"></div>
            <div className="liquid"></div>
          </div>
        </div>

        {/* 텍스트 메시지 부분 */}
        <p className="text-lg font-bold text-gray-800 mb-2 animate-fade-in-up">
          {message}
        </p>
        {currentStep && (
          <p className="text-md text-purple-600 font-semibold mb-4 animate-fade-in-up delay-100">
            {currentStep}
          </p>
        )}
        <p className="text-sm text-gray-500 animate-fade-in-up delay-200">
          공시 데이터 속 숨은 흐름을 읽고 있어요...
        </p>
      </div>

      {/* Set4 원본 CSS 스타일 - scaleFactor를 적용하도록 수정 */}
      <style jsx>{`
        .loading-content {
          position: relative;
          width: ${desiredSpinnerDisplaySize}px !important; /* 수정: 계산된 크기 적용 */
          height: ${desiredSpinnerDisplaySize}px !important; /* 수정: 계산된 크기 적용 */
          animation: rotate 4s ease-in-out infinite;
          filter: url("#gooey");
        }
        @keyframes rotate {
          0% {
            transform: rotate(360deg);
          }
          50% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .loading-content .liquid {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(
            90deg,
            rgba(0, 30, 250, 1) 0%,
            rgba(177, 70, 252, 1) 100%
          );
          width: ${liquidSize}px !important;   /* 수정: 계산된 크기 적용 */
          height: ${liquidSize}px !important;  /* 수정: 계산된 크기 적용 */
          border-radius: 50%;
          --ani_dur: 4s;
        }
        .loading-content .liquid:nth-child(1) {
          top: 0;
          animation: animate1 var(--ani_dur) ease-in-out infinite;
        }
        .loading-content .liquid:nth-child(2) {
          left: 0;
          animation: animate2 var(--ani_dur) ease-in-out infinite;
        }
        .loading-content .liquid:nth-child(3) {
          left: 100%;
          animation: animate3 var(--ani_dur) ease-in-out infinite;
        }
        .loading-content .liquid:nth-child(4) {
          top: 100%;
          animation: animate4 var(--ani_dur) ease-in-out infinite;
        }
        @keyframes animate1 {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 100%;
          }
        }
        @keyframes animate2 {
          0% {
            left: 0;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes animate3 {
          0% {
            left: 100%;
          }
          50% {
            left: 0;
          }
          100% {
            left: 0;
          }
        }
        @keyframes animate4 {
          0% {
            top: 100%;
          }
          50% {
            top: 0;
          }
          100% {
            top: 0;
          }
        }
        .svg {
          width: 0;
          height: 0;
        }

        /* 텍스트 애니메이션 */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;