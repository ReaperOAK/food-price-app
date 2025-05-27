const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 min-h-[200px] flex flex-col justify-center">
          {/* Title placeholder with exact dimensions */}
          <div className="h-12 bg-white/20 rounded w-3/4 mx-auto mb-4 text-center" style={{ minHeight: '48px', height: '48px' }}></div>
          {/* Subtitle placeholder with exact dimensions */}
          <div className="h-8 bg-white/20 rounded w-1/2 mx-auto mb-2" style={{ minHeight: '32px', height: '32px' }}></div>
          {/* Description placeholder with exact dimensions */}
          <div className="h-12 bg-white/20 rounded w-2/3 mx-auto" style={{ minHeight: '48px', height: '48px' }}></div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center py-4" style={{ minHeight: '80px', height: '80px' }}>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2" style={{ minHeight: '16px', height: '16px' }}></div>
                <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" style={{ height: '32px' }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
