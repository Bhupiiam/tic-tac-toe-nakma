interface SquareProps {
  value: number | null;
  onSquareClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onSquareClick }) => {
  const getPlayerMark = () => {
    if (value === 0) {
      return <div className="text-6xl font-bold text-blue-400">X</div>;
    } else if (value === 1) {
      return <div className="text-6xl font-bold text-yellow-400">O</div>;
    }
    return null;
  };

  return (
    <div
      className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-gray-400 bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      onClick={onSquareClick}
    >
      {getPlayerMark()}
    </div>
  );
};

export default Square;
