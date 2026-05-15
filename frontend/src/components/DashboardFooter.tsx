export const DashboardFooter = () => {
  return (
    <div className="mt-12 text-center">
      <div className="inline-flex items-center gap-8 text-sm">
        <div>
          <p className="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            195+
          </p>
          <p className="text-gray-600 font-medium mt-1">Countries</p>
        </div>
        <div>
          <p className="text-3xl font-black bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            50+
          </p>
          <p className="text-gray-600 font-medium mt-1">Data Points</p>
        </div>
        <div>
          <p className="text-3xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            24/7
          </p>
          <p className="text-gray-600 font-medium mt-1">Updated</p>
        </div>
      </div>
    </div>
  );
};
