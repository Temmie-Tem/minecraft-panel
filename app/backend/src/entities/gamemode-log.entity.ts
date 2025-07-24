import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Server } from './server.entity';
import { Player } from './player.entity';

@Entity('GAMEMODE_LOGS')
export class GamemodeLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Server, server => server.gamemodeLogs)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @ManyToOne(() => Player, player => player.gamemodeLogs)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'old_gamemode', length: 20 })
  oldGamemode: string;

  @Column({ name: 'new_gamemode', length: 20 })
  newGamemode: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
