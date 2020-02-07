import gql from 'graphql-tag'
import { clearCache } from '../../shared/utils'

export default (source, query, $apollo, row) => {
  $apollo.mutate({
    mutation: gql`mutation {
      update_${source} (where: {id: {_eq: ${JSON.stringify(row.id)} } }, _set: {isRemoved: true}) { affected_rows }
    }`,
    refetchQueries: () => {
      query.refresh()
    },
    update: (cache) => {
      clearCache(cache, new RegExp(`^${source}`))
    }
  })
}
