/* eslint-disable @typescript-eslint/no-explicit-any */
import { toRefs, reactive, Ref, computed } from '@vue/composition-api'
import { firestore } from 'firebase'
import { db } from '@/db'
import { useFirestore } from '@vueuse/firebase'

interface QueryState<R> {
  error: string | null
  collectionData: Ref<R | firestore.DocumentData>
  loading: boolean
  [name: string]: any
}

export default function<T>(collectionName: string, documentId: Ref<string>) {
  const state: QueryState<T> = reactive({
    // error if one happens
    error: null,
    // the results of the query
    collectionData: [] as any,
    // if the query is loading or ot
    loading: false,
  })

  state.collectionData = computed(() => {
    return useFirestore(
      db.collection(collectionName).doc(documentId.value),
      e => (state.error = e.message)
    )
  })

  return {
    ...toRefs(state),
  }
}
