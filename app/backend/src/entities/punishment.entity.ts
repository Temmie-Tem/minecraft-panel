import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Server } from './server.entity';
import { Player } from './player.entity';
import { User } from './user.entity';

@Entity('PUNISHMENTS')
export class Punishment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Server, server => server.punishments)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @ManyToOne(() => Player, player => player.punishments)
  @JoinColumn({ name: 'target_player_id' })
  targetPlayer: Player;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'moderator_id' })
  moderator: User;

  @Column({ name: 'punishment_type', length: 20 })
  punishmentType: string;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
