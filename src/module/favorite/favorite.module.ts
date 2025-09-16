import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite } from 'src/schemas/favorite.schema';
import { FavoriteSchema } from 'src/schemas/favorite.schema';
import { AuthModule } from '../auth/auth.module';
import { Auth, authSchema } from 'src/schemas/auth.schema';
import { FavoriteRepository } from './repositories/favorite.repository';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Auth.name, schema: authSchema },
    ]),
    AuthModule,
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService, FavoriteRepository],
})
export class FavoriteModule {}
