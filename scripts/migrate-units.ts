import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const unitMap: Record<string, any> = {
  g: 'G',
  grams: 'G',
  oz: 'OZ',
  lb: 'LB',
  ml: 'ML',
  cup: 'CUP',
  item: 'ITEM'
}

async function main() {
  const items = await prisma.produce.findMany()

  for (const item of items) {
    const mappedUnit = unitMap[item.quantityUnit?.toLowerCase()] || 'ITEM'

    await prisma.produce.update({
      where: { id: item.id },
      data: {
        quantityValue: item.quantityValue,
        quantityUnit: mappedUnit
      }
    })
  }
}

main()
  .then(() => console.log('Migration complete'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())