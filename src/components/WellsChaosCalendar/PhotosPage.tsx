import { Camera, Heart, Image, Sparkles } from 'lucide-react';
import type { EventTheme, Trip } from '../../types/wellsChaos';

type PhotosPageProps = {
  trip: Trip;
  theme: EventTheme;
};

const PhotosPage = ({ trip, theme }: PhotosPageProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-24`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
            📸 Photo Memories
          </h1>
          <div className="text-xs text-gray-400 italic">{trip.name}</div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in">
          {/* Decorative Camera Icon */}
          <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${theme.primary} flex items-center justify-center mb-6 shadow-lg`}>
            <Camera size={48} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Photo Memories
          </h2>
          <p className="text-gray-500 mb-8">
            Coming soon! Upload and share your favorite trip moments.
          </p>

          {/* Feature Preview */}
          <div className="space-y-3 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Image size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Upload Photos</div>
                <div className="text-xs text-gray-500">Share your magical moments</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-orange-50">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                <Heart size={20} className="text-pink-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">React & Comment</div>
                <div className="text-xs text-gray-500">Love your family's photos</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Sparkles size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Create Albums</div>
                <div className="text-xs text-gray-500">Organize by day or park</div>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100">
            <div className="text-2xl mb-2">✨🎢🏰</div>
            <p className="text-sm text-purple-700 font-medium">
              For now, focus on making memories!
            </p>
            <p className="text-xs text-purple-600 mt-1">
              The photo sharing feature is coming in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotosPage;
