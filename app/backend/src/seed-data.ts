import { DataSource } from 'typeorm';
import * as entities from './entities';

async function seedData() {
  console.log('🌱 데이터베이스 시드 데이터 생성을 시작합니다...');
  
  // SQLite 데이터베이스 연결
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'dev.sqlite',
    entities: Object.values(entities),
    synchronize: true, // 개발용 - 테이블 자동 생성
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // 1. 샘플 사용자 생성
    const userRepo = dataSource.getRepository(entities.User);
    const sampleUser = userRepo.create({
      provider: 'google',
      providerId: 'google_123456789',
      email: 'admin@minecraft-panel.com',
      nickname: 'AdminUser',
      role: 'admin',
    });
    await userRepo.save(sampleUser);
    console.log('👤 샘플 사용자 생성:', sampleUser.email);

    // 2. 샘플 노드 생성
    const nodeRepo = dataSource.getRepository(entities.Node);
    const sampleNode = nodeRepo.create({
      name: 'Main Node',
      fqdn: 'minecraft-node.example.com',
      authToken: 'sample_auth_token_for_testing',
    });
    await nodeRepo.save(sampleNode);
    console.log('🖥️ 샘플 노드 생성:', sampleNode.name);

    // 3. 샘플 서버 생성
    const serverRepo = dataSource.getRepository(entities.Server);
    const sampleServer = serverRepo.create({
      id: 'srv_' + Date.now(),
      name: 'Survival Server',
      serverType: 'vanilla',
      version: '1.20.1',
      memory: '4G',
      cpus: '2.0',
      port: 25565,
      hostPath: '/minecraft/servers/survival',
      dockerImage: 'itzg/minecraft-server:latest',
      environment: 'EULA=TRUE',
      wingsServerId: 'wings_srv_001',
      owner: sampleUser,
      node: sampleNode,
    });
    await serverRepo.save(sampleServer);
    console.log('🎮 샘플 서버 생성:', sampleServer.name);

    console.log('\n🎉 기본 시드 데이터 생성이 완료되었습니다!');
    console.log('📋 생성된 데이터:');
    console.log(`  - 사용자: 1개 (${sampleUser.email})`);
    console.log(`  - 노드: 1개 (${sampleNode.name})`);
    console.log(`  - 서버: 1개 (${sampleServer.name})`);

  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

// 스크립트 실행
seedData().catch(console.error);
