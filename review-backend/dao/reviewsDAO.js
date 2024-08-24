import { ObjectId } from 'mongodb';
import fetch from 'node-fetch';

let reviews;

export default class ReviewsDAO {
  static async injectDB(conn) {
    if (reviews) {
      return;
    }
    try {
      reviews = await conn.db("reviews").collection("reviews");
    } catch (e) {
      console.error(`Unable to establish collection handles in ReviewsDAO: ${e}`);
    }
  }

  static async fetchMovieDetails(movieId) {
    const apiKey = "your_tmdb_api_key";
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=b0d86c7e479ae6e66b1d9e00dd61cc74}`);
    return await response.json();
  }

  static async addReview(movieId, user, review) {
    try {
      const movieDetails = await this.fetchMovieDetails(movieId);

      const reviewDoc = {
        movieId: movieId,
        user: user,
        review: review,
        releaseDate: movieDetails.release_date,
        description: movieDetails.overview,
        imdbRating: movieDetails.vote_average,  // TMDb rating is used instead of IMDb
      };

      return await reviews.insertOne(reviewDoc);
    } catch (e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

  static async getReview(reviewId) {
    try {
      return await reviews.findOne({ _id: ObjectId(reviewId) });
    } catch (e) {
      console.error(`Unable to get review: ${e}`);
      return { error: e };
    }
  }

  static async getReviewsByMovieId(movieId) {
    try {
      const cursor = await reviews.find({ movieId: parseInt(movieId) });
      return cursor.toArray();
    } catch (e) {
      console.error(`Unable to get review: ${e}`);
      return { error: e };
    }
  }
}
