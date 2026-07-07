import { motion } from 'framer-motion';
import { FaTelegramPlane } from 'react-icons/fa';

const FloatingChatbot = () => {
  // Ganti URL ini dengan link bot Telegram Anda yang sebenarnya
  const telegramBotUrl = "https://t.me/CSPropscode_bot";

  return (
    <motion.a
      href={telegramBotUrl}
      target="_blank"
      rel="noreferrer"
      className="floating-chatbot"
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Tanya FAQ via Telegram"
    >
      <FaTelegramPlane size={24} />
      <span className="chatbot-tooltip">Tanya FAQ (AI)</span>
    </motion.a>
  );
};

export default FloatingChatbot;
