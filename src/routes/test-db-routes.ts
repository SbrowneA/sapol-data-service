import {Router} from "express";
import {TestDbConnectionService} from "../testing/test-db-connection.service.ts";


const testDbRoutes = Router();

testDbRoutes.get('/streets-by-suburb', async (req, res) => {
  const testDbConnectionService = new TestDbConnectionService();
  const result = await testDbConnectionService.runQuery('SELECT * FROM streets_by_suburb LIMIT 10');
  res.json({message: 'BOOP', result });
});

export default testDbRoutes;