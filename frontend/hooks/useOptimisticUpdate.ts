import { useMutation, type MutationHookOptions } from '@apollo/client';
import { toast } from 'sonner';

export function useOptimisticUpdate<TData = any, TVariables = any>(
  mutation: any,
  options: MutationHookOptions<TData, TVariables> = {}
) {
  const [mutate, { loading, error, data }] = useMutation<TData, TVariables>(mutation, {
    ...options,
    onError: (error) => {
      toast.error('Update Failed', {
        description: error.message,
      });
      options.onError?.(error);
    },
    onCompleted: (data) => {
      toast.success('Update Successful');
      options.onCompleted?.(data);
    },
  });

  return { mutate, loading, error, data };
}
