import { useRouter } from '@tanstack/react-router';

const useGoBack = () => {
  const router = useRouter();

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return goBack;
};

export default useGoBack;
