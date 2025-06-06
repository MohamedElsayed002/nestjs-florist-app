<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).



```ts

@Get()
async findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.catsService.findAll({ activeOnly, page });
}

```

```ts
    // Search for products by title or description
    async searchProducts(query: string, lang: string = "en"): Promise<ProductDocument[]> {
        return this.productModel.find()
            .populate({
                path: "details",
                match: {
                    lang,
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } },
                    ],
                },
            })
            .exec();
    }
```

{
  "message": "No favorites found for this user.",
  "error": "Not Found",
  "statusCode": 404
}


{
  "message": [
    {
      "_id": "67ebf799448b2ddc8db8013e",
      "user": "67d1d7f0e32b4a36143aee61",
      "products": [],
      "__v": 95
    }
  ]
}

{
  "message": [
    {
      "_id": "67ebf799448b2ddc8db8013e",
      "user": "67d1d7f0e32b4a36143aee61",
      "products": [
        {
          "_id": "67dc62a600c3c20f18414641",
          "price": 100,
          "quantity": 30,
          "sold": 0,
          "details": [],
          "createdAt": "2025-03-20T18:47:02.898Z",
          "updatedAt": "2025-03-20T18:48:32.783Z",
          "__v": 0,
          "image": "https://res.cloudinary.com/doa5lqxcu/image/upload/v1742496512/products/iued2cpax9bo5oxxqde1.png",
          "imageId": "products/iued2cpax9bo5oxxqde1",
          "category": "show"
        }
      ],
      "__v": 96
    }
  ]
}






{
  "message": "Cart not found",
  "error": "Not Found",
  "statusCode": 404
}


{
  "_id": "67ea7e53c20464f0110f2e58",
  "user": "67d1d7f0e32b4a36143aee61",
  "cartItems": [
    {
      "product": {
        "_id": "67e3426c3641252a2f4d7697",
        "price": 94,
        "quantity": 8,
        "sold": 0,
        "details": [
          {
            "_id": "67e3426c3641252a2f4d7698",
            "lang": "en",
            "title": "Euphoria",
            "slug": "euphoria",
            "description": "A state of pure joy and bliss, where happiness knows no limits.",
            "__v": 0
          }
        ],
        "createdAt": "2025-03-25T23:55:25.010Z",
        "updatedAt": "2025-03-25T23:55:45.199Z",
        "__v": 0,
        "image": "https://res.cloudinary.com/doa5lqxcu/image/upload/v1742946944/products/tpzinuhn3kmsv48qpwr1.png",
        "imageId": "products/tpzinuhn3kmsv48qpwr1",
        "category": "shop",
        "id": "67e3426c3641252a2f4d7697"
      },
      "quantity": 3,
      "price": 282,
      "_id": "67ea7e53c20464f0110f2e59",
      "id": "67ea7e53c20464f0110f2e59"
    },
    {
      "product": {
        "_id": "67e342e43641252a2f4d76a4",
        "price": 120,
        "quantity": 30,
        "sold": 0,
        "details": [
          {
            "_id": "67e342e43641252a2f4d76a5",
            "lang": "en",
            "title": "Selenia",
            "slug": "selenia",
            "description": "A mystical name inspired by the moon, symbolizing serenity and magic",
            "__v": 0
          }
        ],
        "createdAt": "2025-03-25T23:57:25.464Z",
        "updatedAt": "2025-03-25T23:57:45.015Z",
        "__v": 0,
        "image": "https://res.cloudinary.com/doa5lqxcu/image/upload/v1742947064/products/fkdtpttmlyv7ccxu0sqq.png",
        "imageId": "products/fkdtpttmlyv7ccxu0sqq",
        "category": "shop",
        "id": "67e342e43641252a2f4d76a4"
      },
      "quantity": 1,
      "price": 120,
      "_id": "67ea7f01c20464f0110f2e6b",
      "id": "67ea7f01c20464f0110f2e6b"
    },
    {
      "product": {
        "_id": "67e3416b08b5a34aea2343fc",
        "price": 80,
        "quantity": 2,
        "sold": 0,
        "details": [
          {
            "_id": "67e3416b08b5a34aea2343fd",
            "lang": "en",
            "title": "Aurora Classic",
            "slug": "aurora-classic",
            "description": "A timeless glow of enchanting lights dancing across the night sky.",
            "__v": 0
          }
        ],
        "createdAt": "2025-03-25T23:51:08.278Z",
        "updatedAt": "2025-03-25T23:51:56.832Z",
        "__v": 0,
        "image": "https://res.cloudinary.com/doa5lqxcu/image/upload/v1742946716/products/wesocmdviubav4rxscxn.png",
        "imageId": "products/wesocmdviubav4rxscxn",
        "category": "shop",
        "id": "67e3416b08b5a34aea2343fc"
      },
      "quantity": 8,
      "price": 640,
      "_id": "67ea7f70c20464f0110f2e77",
      "id": "67ea7f70c20464f0110f2e77"
    }
  ],
  "totalPrice": 1042,
  "totalPriceDiscount": 0,
  "createdAt": "2025-03-31T11:36:51.806Z",
  "updatedAt": "2025-04-01T23:46:10.048Z",
  "__v": 2,
  "id": "67ea7e53c20464f0110f2e58"
}