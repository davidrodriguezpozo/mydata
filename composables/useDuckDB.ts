import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

// Select a bundle based on browser checks
const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
// Instantiate the asynchronus version of DuckDB-wasm
const worker = new Worker(bundle.mainWorker!);
const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger, worker);
await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

async function loadExtensions() {
  const connection = await db.connect();
  await Promise.all([
    connection.query("INSTALL parquet"),
    connection.query("INSTALL httpfs")
  ]);
  await Promise.all([
    connection.query("LOAD parquet"),
    connection.query("LOAD httpfs")
  ]);
}

await loadExtensions();


// Use DuckDB

const useDuckDB = () => {

  const connection = async (): Promise<duckdb.AsyncDuckDBConnection> => {
    return await db.connect();
  }

  const execute = async (sql: string): Promise<void> => {
    const conn = await connection();
    await conn.query(sql);
    conn.close();
  }

  async function* queryGenerator(sql: string): AsyncGenerator<Object> {
    const conn = await connection();
    // Fetch results layzily
    for await (const batch of await conn.send(sql)) {
      for (const row of batch) {
        yield row.toJSON();
      }
    }
    conn.close();
    return 10;
  }

  async function query(sql: string): Promise<Object[]> {
    const conn = await connection();
    const results = await conn.query(sql);
    conn.close();
    return results.toArray().map((row) => row.toJSON());
  }

  const close = async (conn: duckdb.AsyncDuckDBConnection): Promise<void> => {
    await conn.close();
  }

  const _processCSV = async (file: File): Promise<void> => {
    const content = await file.text();
    await db.registerFileText(file.name, content);
    const c = await connection();
    c.close();
  }

  const _processParquet = async (file: File): Promise<void> => {
    console.log('Processing parquet file');
    await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
  }

  const uploadFile = async (file: File): Promise<string> => {
    const table = file.name.split('.')[0].normalize("NFKD");
    const ext = file.name.split('.').pop();
    if (ext === 'csv') {
      await _processCSV(file);
    } else if (ext === 'parquet') {
      await _processParquet(file);
    } else {
      throw new Error('Unsupported file format');
    }
    return table;
  }

  return {
    connection,
    query,
    close,
    uploadFile,
    execute,
    queryGenerator
  }
}

export default useDuckDB;
