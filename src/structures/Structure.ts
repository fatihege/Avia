import { Snowflake } from 'discord.js';

export default abstract class Structure<M, I> {
    protected model: M;
    public id: Snowflake;

    protected constructor(model: M, data: I) {
        this.model = model;
        // @ts-ignore
        this.id = data.id;

        this.setup(data);
    }

    protected abstract setup(data: I);

    public async delete(): Promise<M | any> {
        try {
            // @ts-ignore
            return this.model.findOne({
                where: {
                    id: this.id as string
                }
            }).then((data) => {
                if (data) {
                    data.destroy();
                }
            });
        } catch (err) {
            return err;
        }
    }

    public async update(data: I): Promise<void> {
        // @ts-ignore
        const update = await this.model.update(data, {
            where: {
                id: this.id
            }
        });

        this.setup(data);
    }
}