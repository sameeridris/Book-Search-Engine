const typeDefs = `
type User{
    _id: ID
    username: String
    email: String
    bookCount: Number
    savedBooks: [Book]!
}

type Book{
    bookId: ID
    authors: [String]
    description: String
    title: String
    image: String
    link: String
}

type Auth{
    token: String
    user: User
}

type Query {
    me: User
}

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(author:[String]!, description: String!, title: String!, bookId: ID!, image: String!, link: String!)
    removeBook(bookId: ID!): User
}
`

export default typeDefs;