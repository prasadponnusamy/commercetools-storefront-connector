import getClient from './client'

export default async function createAppData(req) {
    const client = await getClient(req)
    const { results = [] } = await client.getMenu();
    const finalresults = [];
    //console.log(results, results);
    const parentresults = results.filter(cat => { return cat.ancestors.length != 0 });
    const level0 = results.filter(cat => { return cat.ancestors.length == 0 })
        .map(cat => { return { id: cat.id, name: cat.name.en, childrens: [] } });

    for (let cat of level0) {
        cat.childrens = parentresults.filter(x => x.parent.id == cat.id)
            .map(y => { return { id: y.id, name: y.name.en, childrens: [] } });
    }

    for (let lv0 of level0) {
        for (let cat of lv0.childrens) {
            cat.childrens = parentresults.filter(x => x.parent.id == cat.id)
                .map(y => { return { id: y.id, name: y.name.en, childrens: [] } });
            // if (cat.childrens.length != 0)
            //     finalresults.push(cat)
            //console.log(cat.childrens, 'cat.childrens', cat)
        }
    }
    //console.log(level0);
    const tabs = level0.map(cat => {
        const tab = {
            text: cat.name,
            as: `/s/${cat.id}`,
            href: '/s/[...categorySlug]',
        }
        if (cat.childrens) {
            tab.items = cat.childrens.map(cat => {
                return {
                    text: cat.name,
                    as: `/s/${cat.id}`,
                    href: '/s/[...categorySlug]',
                }
            })
        }
        return tab
    })

    return Promise.resolve({ menu: { items: tabs }, tabs })
}