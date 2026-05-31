import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { MatchesModule } from './modules/matches/matches.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { StreamModule } from './modules/stream/stream.module';
import { AntiCheatModule } from './modules/anti-cheat/anti-cheat.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WithdrawModule } from './modules/withdraw/withdraw.module';
import { BannersModule } from './modules/banners/banners.module';
import { NoticesModule } from './modules/notices/notices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'ff_tournament'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    TeamsModule,
    TournamentsModule,
    MatchesModule,
    LeaderboardModule,
    WalletModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
    SponsorsModule,
    StreamModule,
    AntiCheatModule,
    AnalyticsModule,
    WithdrawModule,
    BannersModule,
    NoticesModule,
  ],
})
export class AppModule {}
