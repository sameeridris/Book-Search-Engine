import { Book, User }  from '../models/index.js';


import { signToken, AuthenticationError } from '../utils/auth.js';

interface AddUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
}

interface LoginUserArgs {
    username: string;
    email: string;
    password: string;
    savedBooks: [string];
}

interface UserArgs {
    username: string;
}

interface BookArgs {
    bookId: string;
    authors: string;
    description: string;
    image: string;
    link: string;
    title: string;
}

interface AddBookArgs {
    input: {
        authors: string;
        bookId: string;
        title: string;
    }
}

const resolvers = {
    Query: {
        users: async () => {
            return User.find().populate('books');
        },
        user: async (_parent: any, { username }: UserArgs) => {
            return User.findOne({ username }).populate('books');
        },
        books: async () => {
            return await Book.find().sort({ createdAt: -1 });
        },
        book: async (_parent: any, { bookId }: BookArgs) => {
            return await Book.findOne({ _id: bookId });
        },
        // Query to get the authenticated user's information
        me: async (_parent: any, _args: any, context: any) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('books');
            }
            throw new AuthenticationError('Could not authenticate user.');
        },
    },
    Mutation: {
        addUser: async (_parent: any, { input }: AddUserArgs) => {
            // Create a new user with the provided username, email, and password
            const user = await User.create({ ...input });

            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);

            // Return the token and the user
            return { token, user };
        },

        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            // Find a user with the provided email
            const user = await User.findOne({ email });

            // If no user is found, throw an AuthenticationError
            if (!user) {
                throw new AuthenticationError('Could not authenticate user.');
            }

            // Check if the provided password is correct
            const correctPw = await user.isCorrectPassword(password);

            // If the password is incorrect, throw an AuthenticationError
            if (!correctPw) {
                throw new AuthenticationError('Could not authenticate user.');
            }

            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);

            // Return the token and the user
            return { token, user };
        },
        addBook: async (_parent: any, { input }: AddBookArgs, context: any) => {
            if (context.user) {
                const book = await Book.create({ ...input });

                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { books: Book._id } }
                );

                return book;
            }
            throw AuthenticationError;
            ('You need to be logged in!');
        },
        removeThought: async (_parent: any, { bookId }: BookArgs, context: any) => {
            if (context.user) {
                const book = await Book.findOneAndDelete({
                    _id: bookId,

                });

                if (!Book) {
                    throw AuthenticationError;
                }

                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { thoughts: Book._id } }
                );

                return book;
            }
            throw AuthenticationError;
        },
    },
};

export default resolvers;