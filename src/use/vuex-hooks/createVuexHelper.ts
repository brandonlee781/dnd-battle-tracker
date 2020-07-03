/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { getCurrentInstance, computed } from '@vue/composition-api'
import { IUseState, IUseGetters, IUseMutations, IUseActions } from './interface'

export function getInstance() {
  const vm = getCurrentInstance() || window.instance
  if (!vm) {
    throw new Error(
      'You must use this function within the "setup()" method, or insert the store as first argument.'
    )
  }
  return vm
}

export enum Helper {
  State,
  Getters,
  Mutations,
  Actions,
}

type Helpers = IUseState | IUseGetters | IUseMutations | IUseActions

function handleComputed(mappedFn: any) {
  return computed(() => mappedFn.call(getInstance()))
}
function handleMethods<T>(mappedFn: any): T {
  return mappedFn.bind(getInstance())
}

const helpers = {
  [Helper.State]: { fn: mapState, handler: handleComputed },
  [Helper.Getters]: { fn: mapGetters, handler: handleComputed },
  [Helper.Mutations]: { fn: mapMutations, handler: handleMethods },
  [Helper.Actions]: { fn: mapActions, handler: handleMethods },
}

export default function createVuexHelper<T extends Helpers>(h: Helper) {
  const helper = helpers[h]

  return ((...args) => {
    // @ts-ignore
    const mapper = (helper.fn as T)(...args)
    const dictionary = {}
    Object.keys(mapper).forEach(key => {
      dictionary[key] = helper.handler<typeof mapper>(mapper[key])
    })

    return dictionary
  }) as T
}

export * from './interface'
