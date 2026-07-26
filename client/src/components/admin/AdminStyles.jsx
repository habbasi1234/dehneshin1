export default function AdminStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Vazirmatn:wght@300;400;500;700;900&display=swap');

      :root {
        --admin-primary: #4CAF50;
        --admin-primary-dark: #388E3C;
        --admin-primary-light: #66BB6A;
        --admin-primary-rgb: 76, 175, 80;
        --admin-bg: #F5F0E8;
        --admin-surface: #FFFFFF;
        --admin-surface-hover: #FAFAF7;
        --admin-card: #FFFFFF;
        --admin-input-bg: #FFFFFF;
        --admin-input-border: #D4D0C8;
        --admin-text: #2D2D2D;
        --admin-text-secondary: #6B6B6B;
        --admin-border: rgba(0, 0, 0, 0.08);
        --admin-shadow: rgba(0, 0, 0, 0.06);
      }

      [data-theme="green"] {
        --admin-primary: #4CAF50;
        --admin-primary-dark: #388E3C;
        --admin-primary-light: #66BB6A;
        --admin-primary-rgb: 76, 175, 80;
      }
      [data-theme="orange"] {
        --admin-primary: #FF9800;
        --admin-primary-dark: #E65100;
        --admin-primary-light: #FFB74D;
        --admin-primary-rgb: 255, 152, 0;
      }
      [data-theme="red"] {
        --admin-primary: #F44336;
        --admin-primary-dark: #C62828;
        --admin-primary-light: #EF5350;
        --admin-primary-rgb: 244, 67, 54;
      }
      [data-theme="blue"] {
        --admin-primary: #2196F3;
        --admin-primary-dark: #1565C0;
        --admin-primary-light: #64B5F6;
        --admin-primary-rgb: 33, 150, 243;
      }

      .admin-root {
        --gold: var(--admin-primary);
        --gold-light: var(--admin-primary-light);
        --gold-dark: var(--admin-primary-dark);
        --bg-deep: var(--admin-bg);
        --bg-card: var(--admin-card);
        --bg-glass: var(--admin-surface);
        --text-primary: var(--admin-text);
        --text-secondary: var(--admin-text-secondary);
        --border-glass: var(--admin-border);
      }

      .admin-bg {
        position: fixed;
        inset: 0;
        z-index: -1;
        background: var(--admin-bg);
        overflow: hidden;
      }

      .admin-bg::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background:
          radial-gradient(ellipse at 20% 50%, rgba(var(--admin-primary-rgb), 0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(var(--admin-primary-rgb), 0.03) 0%, transparent 50%);
        animation: adminBgShift 20s ease-in-out infinite alternate;
      }

      @keyframes adminBgShift {
        0% { transform: translate(0, 0) rotate(0deg); }
        100% { transform: translate(-5%, -5%) rotate(5deg); }
      }

      .admin-glass {
        background: var(--admin-surface);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--admin-border);
        border-radius: 16px;
        box-shadow: 0 2px 12px var(--admin-shadow);
      }

      .admin-glass:hover {
        border-color: rgba(var(--admin-primary-rgb), 0.3);
        box-shadow: 0 4px 20px rgba(var(--admin-primary-rgb), 0.08);
      }

      .gold-glow {
        text-shadow: 0 0 40px rgba(var(--admin-primary-rgb), 0.15);
      }

      .admin-input {
        background: var(--admin-input-bg) !important;
        border: 1px solid var(--admin-input-border) !important;
        border-radius: 8px !important;
        padding: 12px 14px !important;
        color: var(--admin-text) !important;
        font-size: 13px !important;
        outline: none !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
      }

      .admin-input:focus {
        border-color: var(--admin-primary) !important;
        box-shadow: 0 0 0 3px rgba(var(--admin-primary-rgb), 0.1) !important;
        background: var(--admin-input-bg) !important;
      }

      .admin-input::placeholder {
        color: #999;
      }

      .admin-select {
        background: var(--admin-input-bg) !important;
        border: 1px solid var(--admin-input-border) !important;
        border-radius: 8px !important;
        padding: 12px 14px !important;
        color: var(--admin-text) !important;
        font-size: 13px !important;
        outline: none !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
        appearance: none;
        cursor: pointer;
      }

      .admin-select:focus {
        border-color: var(--admin-primary) !important;
        box-shadow: 0 0 0 3px rgba(var(--admin-primary-rgb), 0.1) !important;
      }

      .admin-textarea {
        background: var(--admin-input-bg) !important;
        border: 1px solid var(--admin-input-border) !important;
        border-radius: 8px !important;
        padding: 12px 14px !important;
        color: var(--admin-text) !important;
        font-size: 13px !important;
        outline: none !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
        resize: vertical;
      }

      .admin-textarea:focus {
        border-color: var(--admin-primary) !important;
        box-shadow: 0 0 0 3px rgba(var(--admin-primary-rgb), 0.1) !important;
        background: var(--admin-input-bg) !important;
      }

      .admin-btn-primary {
        background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark)) !important;
        background-size: 200% 200% !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 24px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        transition: all 0.4s ease !important;
      }

      .admin-btn-primary:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 25px rgba(var(--admin-primary-rgb), 0.3) !important;
      }

      .admin-btn-secondary {
        background: var(--admin-surface) !important;
        color: var(--admin-text) !important;
        border: 1px solid var(--admin-input-border) !important;
        border-radius: 8px !important;
        padding: 10px 24px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
      }

      .admin-btn-secondary:hover {
        background: var(--admin-surface-hover) !important;
        border-color: var(--admin-primary) !important;
      }

      .admin-btn-danger {
        background: linear-gradient(135deg, #EF5350, #C62828) !important;
        color: #fff !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 24px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
      }

      .admin-btn-danger:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 25px rgba(239, 83, 80, 0.3) !important;
      }

      .admin-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .admin-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .admin-scroll::-webkit-scrollbar-thumb {
        background: rgba(var(--admin-primary-rgb), 0.2);
        border-radius: 3px;
      }
      .admin-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(var(--admin-primary-rgb), 0.4);
      }

      .admin-divider {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 20px 0;
      }
      .admin-divider::before,
      .admin-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(var(--admin-primary-rgb), 0.3), transparent);
      }
      .admin-divider .diamond {
        width: 8px;
        height: 8px;
        background: var(--admin-primary);
        transform: rotate(45deg);
        opacity: 0.5;
      }

      .admin-table th {
        background: linear-gradient(135deg, rgba(var(--admin-primary-rgb), 0.08), rgba(var(--admin-primary-rgb), 0.04));
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .admin-pulse {
        animation: adminPulse 1.5s ease-in-out infinite;
      }
      @keyframes adminPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      .admin-page-enter {
        opacity: 0;
        transform: translateY(10px);
      }
      .admin-page-active {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.4s ease;
      }

      @keyframes goldShimmerStat {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }

      @keyframes countUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes borderGlow {
        0%, 100% { border-color: rgba(var(--admin-primary-rgb), 0.12); }
        50% { border-color: rgba(var(--admin-primary-rgb), 0.3); }
      }

      @keyframes arrowSlide {
        0% { opacity: 0; transform: translateX(-8px); }
        100% { opacity: 1; transform: translateX(0); }
      }
    `}</style>
  )
}
