import { useRef, useState } from 'react';
import { gsap } from 'gsap';

const CardNav = ({ onSelectSize }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const cardsRef = useRef([]);

  const items = [
    { label: "3x3", size: 3, desc: "8-Puzzle" },
    { label: "4x4", size: 4, desc: "15-Puzzle" },
    { label: "5x5", size: 5, desc: "24-Puzzle" }
  ];

  const toggleMenu = () => {
    if (!isOpen) {
      setIsOpen(true);
      // أنيميشن الفتح
      gsap.fromTo(contentRef.current, 
        { height: 0, opacity: 0 }, 
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo(cardsRef.current, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, delay: 0.1 }
      );
    } else {
      // أنيميشن القفل
      gsap.to(cardsRef.current, { y: -20, opacity: 0, duration: 0.2, stagger: 0.05 });
      gsap.to(contentRef.current, 
        { height: 0, opacity: 0, duration: 0.3, delay: 0.1, onComplete: () => setIsOpen(false) }
      );
    }
  };

  return (
    // خلينا الـ Nav ياخد مساحته الطبيعية من غير Absolute عشان ما يخبطش في الكلام اللي تحته
    <div className="w-[95%] max-w-[900px] mx-auto mt-6 z-50">
      <nav className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden">

        {/* البار العلوي */}
        <div className="h-[70px] flex items-center justify-between px-4 sm:px-6 relative">
          
          {/* زرار الـ Slider (Hamburger) */}
          <div 
            onClick={toggleMenu} 
            className="cursor-pointer w-10 h-10 flex flex-col justify-center items-center relative z-20"
          >
            <div className={`w-7 sm:w-8 h-[2px] bg-white absolute transition-all duration-300 ${isOpen ? 'rotate-45' : '-translate-y-2'}`} />
            <div className={`w-7 sm:w-8 h-[2px] bg-white absolute transition-all duration-300 ${isOpen ? '-rotate-45' : 'translate-y-2'}`} />
          </div>

          {/* العنوان (متسنتر تماماً وممنوع يتكسر) */}
          <div className="flex-1 text-center font-bold text-[14px] sm:text-xl tracking-[0.2em] text-white whitespace-nowrap">
            AI N-PUZZLE SOLVER
          </div>

          {/* مساحة فارغة عشان الـ Flex يوزن العنوان في النص بالظبط */}
          <div className="w-10"></div>
        </div>

        {/* الكروت اللي بتنزل (مخفية في البداية) */}
        <div ref={contentRef} className="h-0 opacity-0 overflow-hidden">
          <div className="px-6 pb-6 pt-2 flex flex-col md:flex-row gap-4 justify-center items-center">
            {items.map((item, idx) => (
              <div
                key={idx}
                ref={el => cardsRef.current[idx] = el}
                onClick={() => onSelectSize(item.size)}
                className="cursor-pointer w-full md:w-1/3 py-8 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 transition-all duration-300 flex flex-col items-center justify-center hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                <span className="text-3xl font-bold text-white mb-2">{item.label}</span>
                <span className="text-sm text-blue-300">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </nav>
    </div>
  );
};

export default CardNav;