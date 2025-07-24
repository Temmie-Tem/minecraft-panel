import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PlayerSession } from './player-session.entity';
import { Punishment } from './punishment.entity';
import { CommandLog } from './command-log.entity';
import { GamemodeLog } from './gamemode-log.entity';

@Entity('PLAYERS')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 36, unique: true })
  uuid: string;

  @Column({ name: 'last_known_name', length: 16 })
  lastKnownName: string;

  @Column({ name: 'is_op', type: 'boolean', default: false })
  isOp: boolean;

  @Column({ name: 'first_seen_at', type: 'datetime' })
  firstSeenAt: Date;

  @Column({ name: 'last_seen_at', type: 'datetime' })
  lastSeenAt: Date;

  @Column({ name: 'total_playtime', type: 'integer', default: 0 })
  totalPlaytime: number;

  // 양방향 관계
  @OneToMany(() => PlayerSession, session => session.player)
  sessions: PlayerSession[];

  @OneToMany(() => Punishment, punishment => punishment.targetPlayer)
  punishments: Punishment[];

  @OneToMany(() => CommandLog, commandLog => commandLog.player)
  commandLogs: CommandLog[];

  @OneToMany(() => GamemodeLog, gamemodeLog => gamemodeLog.player)
  gamemodeLogs: GamemodeLog[];
}
