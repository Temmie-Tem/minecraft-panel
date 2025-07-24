import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';
import { Server } from './server.entity';

@Entity('PLAYER_SESSIONS')
export class PlayerSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, player => player.sessions)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => Server, server => server.playerSessions)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @Column({ name: 'login_at', type: 'datetime' })
  loginAt: Date;

  @Column({ name: 'logout_at', type: 'datetime', nullable: true })
  logoutAt: Date | null;
}
