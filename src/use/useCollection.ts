/* eslint-disable @typescript-eslint/no-explicit-any */
import { onMounted, Ref, ref } from '@vue/composition-api'
import { firestore } from 'firebase'
import { db } from '@/db'
import { useFirestore } from '@vueuse/firebase'

export interface QueryFilter {
  field: string | firestore.FieldPath
  op: firestore.WhereFilterOp
  value: any
}

export interface QueryOrderBy {
  field: string
  direction?: 'desc' | 'asc'
}

export interface QueryOptions {
  onMounted?: boolean
  query?: QueryFilter
  orderBy?: QueryOrderBy
  limit?: number
}

interface QueryState<R> {
  error: Ref<string | null>
  collectionData: Ref<R[]>
  loading: Ref<boolean>
  [name: string]: any
}

interface UseCollectionResponse<R> {
  getCollection: Function
  error: Ref<string | null>
  collectionData: Ref<R[]>
  loading: Ref<boolean>
}

export default function<T>(
  collectionName: string,
  queryOptions: QueryOptions = {}
): UseCollectionResponse<T> {
  let theQuery = queryOptions.query
    ? db
        .collection(collectionName)
        .where(
          queryOptions.query.field,
          queryOptions.query.op,
          queryOptions.query.value
        )
    : db.collection(collectionName)

  theQuery = queryOptions.limit ? theQuery.limit(queryOptions.limit) : theQuery
  theQuery = queryOptions.orderBy
    ? theQuery.orderBy(
        queryOptions.orderBy.field,
        queryOptions.orderBy.direction || 'desc'
      )
    : theQuery
  const state: QueryState<T> = {
    // error if one happens
    error: ref(null),
    // the results of the query
    collectionData: useFirestore(
      theQuery,
      e => (state.error.value = e.message)
    ) as Ref<T[]>,
    // if the query is loading or ot
    loading: ref(false),
  }

  const getCollection = ({ query, orderBy, limit } = queryOptions): void => {
    let theQuery = query
      ? db.collection(collectionName).where(query.field, query.op, query.value)
      : db.collection(collectionName)

    theQuery = limit ? theQuery.limit(limit) : theQuery
    theQuery = orderBy
      ? theQuery.orderBy(orderBy.field, orderBy.direction || 'desc')
      : theQuery

    state.collectionData = useFirestore(
      theQuery,
      e => (state.error.value = e.message)
    ) as Ref<T[]>
  }

  /**
   * there is the option to load the query when the component
   * is mounted, you need to set the option in the `queryOptions`
   * params that you pass in
   *
   */
  onMounted(() => {
    queryOptions && queryOptions.onMounted && getCollection(queryOptions)
  })

  return {
    ...state,
    getCollection: getCollection,
  }
}
