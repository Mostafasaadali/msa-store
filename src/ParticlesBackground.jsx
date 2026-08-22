import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1, 
        },
        background: {
          color: {
            value: "#000000", 
          },
        },
        fpsLimit: 60, 
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
          },
          modes: {
            grab: {
              distance: 180,
              links: {
                opacity: 0.8,
                color: "#eab308",
              },
            },
          },
        },
        particles: {
          color: {
            value: "#eab308",
          },
          links: {
            color: "#eab308",
            distance: 160, // زيادة مسافة التوصيل لتكوين خطوط متقاطعة أكثر بكثير
            enable: true,
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.7, // إبطاء الحركة قليلاً لأن الكثافة العالية تحتاج لحركة أهدأ
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "bounce",
            },
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 250, // مضاعفة عدد النقاط لزيادة الكثافة والخطوط
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 2 },
          },
        },
        // أبقينا على حماية الهواتف المحمولة من التعليق
        responsive: [
          {
            maxWidth: 768, 
            options: {
              fpsLimit: 30, 
              particles: {
                number: {
                  value: 50, 
                },
                links: {
                  enable: false, 
                },
              },
            },
          },
        ],
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;