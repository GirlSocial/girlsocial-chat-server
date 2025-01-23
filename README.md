# GirlSocial - A new social network with the focus on inclusivity

GirlSocial will be an open source social platform unlike any other - with a focus on inclusivity.

You will be able to use GirlSocial air-gapped - like any existing social network, or you'll be able to enable integrations with services like pronouns.page and the software will try it's hardest to avoid making other people uncomfortable.

## Planned Release Date?

Unknown. We want to finish this as soon as we can, and have apps for all major platforms out.

This is currently as of writing maintained by a single developer and support is welcome.

## Development

0. (this steps is recommended if you're going to contribute) Fork this repository.
1. `cd server` and `npm install` to install dependencies.
2. `docker-compose -f compose.dev.yaml up --watch --build` to start the development server.
3. Make changes as desired.
4. `docker-compose -f compose.dev.yaml down` to take down the development server.
5. (step for anyone who forked) Commit and push to your forked repository and open a pull request.

## Production

To build this app for production use, go ahead and do the following:

TODO: I'll make a separate repository which you can clone to get a prod ready environment.
