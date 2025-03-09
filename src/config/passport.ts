import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as DiscordStrategy } from "passport-discord";
import { UserModel } from "../models/User";

dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';



passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    callbackURL: `${isProduction ? "https://api.codersforcoders.tech" : 'http://localhost:8000'}/api/auth/github/callback`,
    scope: ['user:email']
},
    async (accessToken: string, refreshToken: string, profile, done) => {
        try {
            let user = await UserModel.findOne({ githubId: profile.id });
            if (!user) {
                user = await UserModel.create({
                    githubId: profile.id,
                    username: profile.username,
                    email: profile.emails?.[0].value,
                    fullname: profile.displayName,
                    avatar: profile._json.avatar_url,
                    githubAccessToken: accessToken,
                    githubRefreshToken: refreshToken
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID as string,
    clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    callbackURL: `${isProduction ? "https://api.codersforcoders.tech" : 'http://localhost:8000'}/api/auth/discord/callback`,
    scope: ['identify', 'email']
},
    async (accessToken: string, refreshToken: string, profile, done) => {
        try {
            let user = await UserModel.findOne({ discordId: profile.id });
            if (!user) {
                user = await UserModel.create({
                    discordId: profile.id,
                    username: profile.username,
                    email: profile.email,
                    fullname: profile.displayName,
                    avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
                    discordAccessToken: accessToken,
                    discordRefreshToken: refreshToken,

                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, (user as any).id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;