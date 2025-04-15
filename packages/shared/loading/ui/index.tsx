import "./style.scss";

type LoadingScreenProps = {
  currentStep: string;
  progress: number; // 0 to 100
};

export const LoadingScreen = ({
  currentStep,
  progress,
}: LoadingScreenProps) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-bar">
          <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loading-step">{currentStep}</div>
      </div>
    </div>
  );
};
