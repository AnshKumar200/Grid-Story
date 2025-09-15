import { useState } from 'react';
import LiveCanvas from './components/LiveCanvas';
import TimelapseViewer from './components/TimelapseViewer';

function App() {
  const [view, setView] = useState('canvas');

  const getButtonStyle = (buttonView) => {
    const baseStyle = "px-5 py-2 text-md font-semibold rounded-md transition-all duration-200 ease-in-out";
    if (view === buttonView) {
      return `${baseStyle} bg-black text-white shadow-md`;
    }
    return `${baseStyle} bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer`;
  };

  return (
    <div className="font-sans">
      <main>
        {view === 'canvas' ? (
          <LiveCanvas
            appView={view}
            setAppView={setView}
            getButtonStyle={getButtonStyle}
          />
        ) : (
          <TimelapseViewer
            appView={view}
            setAppView={setView}
            getButtonStyle={getButtonStyle}
          />
        )}
      </main>
    </div>
  );
}

export default App;