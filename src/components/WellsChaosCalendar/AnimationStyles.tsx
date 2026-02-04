const AnimationStyles = () => (
  <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
);

export default AnimationStyles;
