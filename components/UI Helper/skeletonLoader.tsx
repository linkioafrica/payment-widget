export const SkeletonLoader = ({ classes }: any) => {
  return (
    <div
      className={`bg-gray-300 dark:bg-gray-600 animate-pulse ${classes}`}
    ></div>
  );
};
