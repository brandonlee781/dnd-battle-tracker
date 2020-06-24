import createVuexHelper, {
  Helper,
  IUseState,
  IUseGetters,
  IUseMutations,
  IUseActions,
  getInstance,
} from './createVuexHelper'
import { ref } from '@vue/composition-api'

export const useState = createVuexHelper<IUseState>(Helper.State)
export const useGetters = createVuexHelper<IUseGetters>(Helper.Getters)
export const useMutations = createVuexHelper<IUseMutations>(Helper.Mutations)
export const useActions = createVuexHelper<IUseActions>(Helper.Actions)
export const useStore = () => {
  const vm = getInstance()
  return ref(vm.$store)
}
