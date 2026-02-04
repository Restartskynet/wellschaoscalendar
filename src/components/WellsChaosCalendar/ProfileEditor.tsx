import { useRef, useState } from 'react';
import { Camera, Crown, Upload, X } from 'lucide-react';
import { THEMES } from '../../data/themes';
import type { Account } from '../../types/wellsChaos';

type ProfileEditorProps = {
  accounts: Account[];
  currentUser: Account;
  onUpdateAccounts: (accounts: Account[]) => void;
  onUpdateUser: (account: Account) => void;
  onClose: () => void;
};

const ProfileEditor = ({
  accounts,
  currentUser,
  onUpdateAccounts,
  onUpdateUser,
  onClose
}: ProfileEditorProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setSelectedImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCroppedImage = () => {
    const updatedAccounts = accounts.map((acc) =>
      acc.username === currentUser.username ? { ...acc, customAvatar: selectedImage } : acc
    );
    onUpdateAccounts(updatedAccounts);
    const updatedUser = updatedAccounts.find((acc) => acc.username === currentUser.username);
    if (updatedUser) {
      onUpdateUser(updatedUser);
    }
    onClose();
    setSelectedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Camera size={24} className="text-purple-500" />
            Edit Profile
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl border-4 border-white shadow-lg overflow-hidden">
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                ) : currentUser.customAvatar ? (
                  <img src={currentUser.customAvatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.defaultAvatar}</span>
                )}
              </div>
              {currentUser.role === 'admin' && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                  <Crown size={20} className="text-white" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Your Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(THEMES).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => {
                    const updatedAccounts = accounts.map((acc) =>
                      acc.username === currentUser.username ? { ...acc, theme: themeName } : acc
                    );
                    onUpdateAccounts(updatedAccounts);
                    const updatedUser = updatedAccounts.find((acc) => acc.username === currentUser.username);
                    if (updatedUser) {
                      onUpdateUser(updatedUser);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    currentUser.theme === themeName
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${THEMES[themeName].primary} mb-2`}></div>
                  <div className="text-xs font-semibold text-gray-700">{themeName}</div>
                </button>
              ))}
            </div>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-200 hover:to-pink-200 transition-all"
          >
            <Upload size={20} />
            Upload New Photo
          </button>

          {selectedImage && (
            <button
              onClick={saveCroppedImage}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Save Changes
            </button>
          )}

          {currentUser.customAvatar && (
            <button
              onClick={() => {
                const updatedAccounts = accounts.map((acc) =>
                  acc.username === currentUser.username ? { ...acc, customAvatar: null } : acc
                );
                onUpdateAccounts(updatedAccounts);
                const updatedUser = updatedAccounts.find((acc) => acc.username === currentUser.username);
                if (updatedUser) {
                  onUpdateUser(updatedUser);
                }
                onClose();
              }}
              className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Remove Custom Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
