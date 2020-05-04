"use strict";

const Post = use("App/Models/Post");

class PostController {
  async index({ auth }) {
    const user = await auth.getUser();

    if (await user.can("read_private_posts")) {
      const posts = await Post.all();

      return posts;
    }

    const posts = await Post.query().where({ type: "public" }).fetch();

    return posts;
  }

  async show({ response, params, auth }) {
    const post = await Post.findOrFail(params.id);

    if (post.type === "public") {
      return post;
    }

    const user = await auth.getUser();

    if (await user.can("read_private_posts")) {
      return post;
    }

    return response.status(403).send({
      error: {
        message: "Você não tem permissão de leitura.",
      },
    });
  }

  async store({ request, auth }) {
    const data = request.only(["title", "content", "type"]);

    const post = await Post.create({ ...data, user_id: auth.user.id });

    return post;
  }

  async update({ params, request, response }) {
    const data = request.only(["title", "content", "type"]);

    const post = await Post.findOrFail(params.id);

    post.merge(data);

    await post.save();

    return post;
  }

  async destroy({ params }) {
    const post = await Post.findOrFail(params.id);

    await post.delete();
  }
}

module.exports = PostController;
