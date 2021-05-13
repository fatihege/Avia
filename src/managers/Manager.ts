import Structure from '../structures/Structure';

export default abstract class Manager<K, V extends Structure<M, D>, M, D> {
    protected cache: Map<K, V> = new Map<K, V>();
    protected model: M;

    protected constructor(model: M) {
        this.model = model;
    }

    protected abstract new(data: D): V;

    public get(key: K) {
        return this.cache.get(key) || this.fetch(key);
    }

    public async fetch(key: K) {
        return new Promise((resolve) => {
            // @ts-ignore
            this.model.findOne({ where: { id: key } })
                .then((data) => {
                    resolve(data ? this.setToCache(data) : undefined);
                });
        });
    }

    public async create(data: D): Promise<V> {
        // @ts-ignore
        const create = this.model.upsert(data);
        return this.setToCache(create);
    }

    public async delete(condition: { id: K }): Promise<V> {
        await this.cache.delete(condition.id);
        // @ts-ignore
        let deleted = await this.model.destroy({
            where: condition,
            force: true
        });

        return deleted;
    }

    public set(key: any, data: V) {
        this.cache.set(key, data);
    }

    public setToCache(data: D) {
        const structure = this.new(data);
        // @ts-ignore
        this.set(structure.id, structure);
        return structure;
    }

    public has(key: K): boolean {
        return this.cache.has(key);
    }

    public get size(): number {
        return this.cache.size;
    }
}