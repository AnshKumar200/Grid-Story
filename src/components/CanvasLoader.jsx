const LoadingSquare = ({ delay }) => {
  return (
    <div
      className="w-8 h-8 bg-gray-700 animate-pulse rounded-lg"
      style={{
        animationDelay: delay,
        animationDuration: '1s'
      }}
    />
  );
};

const CanvasLoader = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div
        className="grid grid-cols-2 gap-3 animate-spin"
        style={{ animationDuration: '2.5s' }}
      >
        <LoadingSquare delay="0s" />
        <LoadingSquare delay="0.5s" />
        <LoadingSquare delay="0.5s" />
        <LoadingSquare delay="0s" />
      </div>
    </div>
  );
};

export default CanvasLoader;