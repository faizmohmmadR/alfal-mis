import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-6 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" dir="ltr">
      <div className="container mx-auto px-4">
        <p className="text-center text-base font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 tracking-widetext-xs">
          Made with <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" /> by 
          <span className="font-semibold text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparenttext-xs">
            Urooj Technology
          </span>
        </p>
      </div>
    </footer>
  );
};
