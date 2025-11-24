const { EmbedBuilder } = require("discord.js")

const LEVELING_MESSAGE = `The best leveling pieces in each section (according to me) are in **bold**.
### Chestpieces
- [Tabula Rasa](https://poewiki.net/wiki/Tabula_Rasa): Provides 6 white linked white sockets and has no level requirement, but also no defences.
- **[Thousand Ribbons]()**: Doesn't come with 6 linked white sockets, but has a lot of other useful stats for any build.
- [Ghostwrithe](): Good for energy shield, not the best though.
### Helmets
- [Goldrim](https://poewiki.net/wiki/Goldrim): Provides up to 40% to all elemental resistances and has no level requirement.
- **[Honourhome]()**: Provides a lot of flat damage, and +2 to level of socketed gems. Get it with a good corruption or double corruption and it can provide a **ton** of extra damage.
- [Thrillsteel](): A cool helmet that provides onslaught, not that great compared to some other options in my opinion.
### Gloves
- **[Lochtonial Caress](https://www.poewiki.net/wiki/Lochtonial_Caress)**: Provides attack and cast speed, as well as power, frenzy, and endurance charges.
- **[Doedre's Tenure]()**: A great item for casters, providing 100% increased spell damage with a measly drawback of 15% reduced cast speed. It's even better for skills like Kinetic Bolt, which get the benefit without the drawback.
### Belts
- **[Darkness Enthroned]()**: Easily one of the best leveling items in the entire game if you get good enough abyss jewels.
- **[Mageblood]()**: I mean, duh.
- [Meginord's Girdle](): Provides lots of life early.
### Boots
- **[Seven-League Step]()**: Easily the best boots in the game for leveling. 50% move speed and *can* be 60% if you get a perfectly rolled corruption!
- [Wanderlust](): The second best pair of leveling boots! 20% move speed and immunity to freezing.
### Amulets
- **[(Replica) Karui Ward]()**: The "two" best leveling amulets in the game (for non-hollow palm at least). They provide insane movement speed and good damage boosts.
- **[Astramentis]()**: The best leveling amulet for hollow palm, and a great leveling unique in general.
### Rings
- **[Le Heup of All]()**: My personal favorite leveling ring. Damage and resists.
- **[Ixchel's Temptation]()**: Can be hard to get a great one, but they are great!
- **[Perandus Signet]()**: The best early-game leveling ring.

WIP
`
module.exports = {
    name: "!!Leveling Items",
    execute(client, message) {
        message.reply(LEVELING_MESSAGE)
    }
}
