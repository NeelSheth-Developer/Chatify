import { Phone, Video } from "lucide-react";

const CallHistory = ({ call }) => {
  const getCallIcon = () => {
    const IconComponent = call.isVideo ? Video : Phone;
    const iconColor = call.type === 'missed' ? 'text-error' : 'text-success';
    return <IconComponent className={`size-4 ${iconColor}`} />;
  };

  const getCallText = () => {
    const prefix = call.type === 'missed' ? 'Missed' : '';
    const callType = call.isVideo ? 'Video' : 'Voice';
    return `${prefix} ${callType} call`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `(${minutes}:${seconds.toString().padStart(2, '0')})`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-base-200/50">
      <span>{getCallIcon()}</span>
      <div className="flex-1">
        <span className="text-sm">{getCallText()}</span>
        {call.duration > 0 && (
          <span className="text-sm text-base-content/70 ml-1">
            {formatDuration(call.duration)}
          </span>
        )}
      </div>
      <span className="text-xs text-base-content/50">{formatTime(call.timestamp)}</span>
    </div>
  );
};

export default CallHistory;
