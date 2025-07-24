import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Node } from './node.entity';
import { PlayerSession } from './player-session.entity';
import { Punishment } from './punishment.entity';
import { CommandLog } from './command-log.entity';
import { GamemodeLog } from './gamemode-log.entity';
import { PerformanceLog } from './performance-log.entity';

@Entity('SERVERS')
export class Server {
  @PrimaryColumn({ length: 36 })
  id: string; // UUID로 사용

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'server_type', length: 20, default: 'vanilla' })
  serverType: string;

  @Column({ length: 20, default: '1.20.1' })
  version: string;

  @Column({ length: 10, default: '2G' })
  memory: string;

  @Column({ length: 10, default: '1.0' })
  cpus: string;

  @Column({ type: 'integer', default: 25565 })
  port: number;

  @Column({ name: 'host_path', length: 500 })
  hostPath: string;

  @Column({ name: 'docker_image', length: 200, nullable: true })
  dockerImage: string;

  @Column({ type: 'text', nullable: true })
  environment: string;

  @Column({ name: 'wings_server_id', length: 50, nullable: true })
  wingsServerId: string;

  @ManyToOne(() => User, user => user.servers)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Node, node => node.servers)
  @JoinColumn({ name: 'node_id' })
  node: Node;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 양방향 관계
  @OneToMany(() => PlayerSession, playerSession => playerSession.server)
  playerSessions: PlayerSession[];

  @OneToMany(() => Punishment, punishment => punishment.server)
  punishments: Punishment[];

  @OneToMany(() => CommandLog, commandLog => commandLog.server)
  commandLogs: CommandLog[];

  @OneToMany(() => GamemodeLog, gamemodeLog => gamemodeLog.server)
  gamemodeLogs: GamemodeLog[];

  @OneToMany(() => PerformanceLog, performanceLog => performanceLog.server)
  performanceLogs: PerformanceLog[];
}
