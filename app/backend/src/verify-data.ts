import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function verifyData() {
  // 애플리케이션 컨텍스트만 생성 (서버 리스닝 X)
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log('🚀 데이터베이스 데이터 검증을 시작합니다...');

  try {
    // DataSource 가져오기
    const dataSource = app.get<DataSource>(DataSource);

    // 각 테이블의 레코드 수 카운트 (SQLite 쿼리 사용)
    const userCount = await dataSource.query('SELECT COUNT(*) as count FROM USERS');
    const serverCount = await dataSource.query('SELECT COUNT(*) as count FROM SERVERS');
    const nodeCount = await dataSource.query('SELECT COUNT(*) as count FROM NODES');
    const playerCount = await dataSource.query('SELECT COUNT(*) as count FROM PLAYERS');

    console.log('\n--- 📊 테이블 레코드 수 ---');
    console.log(`- USERS: ${userCount[0].count} 건`);
    console.log(`- SERVERS: ${serverCount[0].count} 건`);
    console.log(`- NODES: ${nodeCount[0].count} 건`);
    console.log(`- PLAYERS: ${playerCount[0].count} 건`);
    console.log('--------------------------\n');

    // 서버 데이터가 있으면 첫 번째 레코드를 샘플로 출력
    if (serverCount[0].count > 0) {
      const firstServer = await dataSource.query('SELECT * FROM SERVERS LIMIT 1');
      console.log('--- 🖥️ 샘플 서버 데이터 (첫 번째 레코드) ---');
      console.log(JSON.stringify(firstServer[0], null, 2));
      console.log('------------------------------------------\n');
    }

    console.log('✅ 데이터 검증이 성공적으로 완료되었습니다.');

  } catch (error) {
    console.error('❌ 데이터 검증 중 오류가 발생했습니다:', error);
  } finally {
    // 애플리케이션 컨텍스트 종료
    await app.close();
  }
}

verifyData();