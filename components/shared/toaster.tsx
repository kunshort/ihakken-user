// lib/toast.ts
import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

interface ToastProps {
  title: string;
  description?: string;
  duration?: number;
}

const Toast = {
  success: ({ title, description, duration = 10000 }: ToastProps) => {
    sonnerToast.success(title, {
      description,
      duration,
      icon: <CheckCircle2 className="h-5 w-5" />,
      classNames: {
        toast: "border-l-4 border-yellow-600 dark:border-yellow-500",
        title: "!text-white font-semibold",
        description: "!text-white",
        icon: "!text-white",
        closeButton:
          "!absolute  !left-auto  !top-[0px] !right-[-15px]  !bg-black hover:!bg-yellow-600/20 !text-white !shadow-none scale-110",
      },
      style: {
        background: "oklch(0.748 0.166 110.725)",
      },
    });
  },
  error: ({ title, description, duration = 10000 }: ToastProps) => {
    sonnerToast.error(title, {
      description,
      duration,
      icon: <XCircle className="h-5 w-5" />,
      classNames: {
        toast: "border-l-4 border-red-700 bg-red-50 dark:bg-red-950",
        title: "text-red-900 dark:text-red-100 font-semibold",
        description: "text-red-700 dark:text-red-300",
        icon: "text-red-700 dark:text-red-400",
        closeButton:
          "!absolute !left-auto  !top-[0px] !right-[-15px]  bg-red-700 hover:bg-red-800 text-white dark:bg-red-800 dark:hover:bg-red-900 scale-125",
      },
    });
  },
};

export default Toast;
