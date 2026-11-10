import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { t } from '~/lib/i18n';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onImagesSelected?: (images: File[]) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export const SendButton = ({ show, isStreaming, disabled, onClick }: SendButtonProps) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          className="absolute flex justify-center items-center top-[16px] right-[18px] px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl h-[38px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium shadow-sm shadow-blue-600/20"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();

            if (!disabled) {
              onClick?.(event);
            }
          }}
        >
          {!isStreaming ? t('button.send') : t('button.stop')}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
};
