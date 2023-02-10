import {
  Circle,
  Layout,
  Rect,
  Node,
  Text,
} from "@motion-canvas/2d/lib/components"
import { makeScene2D, Scene2D, useScene2D } from "@motion-canvas/2d/lib/scenes"
import { all, waitFor, sequence, delay } from "@motion-canvas/core/lib/flow"
import {
  createRef,
  makeRef,
  range,
  Reference,
} from "@motion-canvas/core/lib/utils"

type TRect = {
  rect: Reference<Rect>
  x: number
  y: number
  value: number
}

const RECT_WIDTH = 100
const RECT_HEIGHT = 50
const GAP = 10
const BASE_DURATION = 1

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

function* moveHorizontal(
  node: Reference<Node>,
  offset: number,
  duration: number,
  direction: "TOP" | "BOTTOM"
) {
  if (direction === "TOP") offset *= -1

  yield* node().position.y(offset, duration)
}

function* swapNodes(
  firstNodeIndex: number,
  secondNodeIndex: number,
  allNodes: TRect[]
) {
  const firstElement = { ...allNodes[firstNodeIndex] }
  const secondElement = { ...allNodes[secondNodeIndex] }

  const temp = allNodes[firstNodeIndex]
  allNodes[firstNodeIndex] = allNodes[secondNodeIndex]
  allNodes[secondNodeIndex] = temp

  yield* moveHorizontal(firstElement.rect, RECT_HEIGHT, BASE_DURATION, "TOP")
  yield* moveHorizontal(
    secondElement.rect,
    RECT_HEIGHT,
    BASE_DURATION,
    "BOTTOM"
  )

  yield* firstElement.rect().position.x(secondElement.x, BASE_DURATION)

  yield* secondElement.rect().position.x(firstElement.x, BASE_DURATION)

  console.log({
    secondElement: secondElement.x,
  })

  yield* moveHorizontal(firstElement.rect, firstElement.y, BASE_DURATION, "TOP")
  yield* moveHorizontal(
    secondElement.rect,
    secondElement.y,
    BASE_DURATION,
    "BOTTOM"
  )
}

function* bubbleSort(allNodes: TRect[]) {
  for (let j = 0; j < allNodes.length - 1; j++) {
    const firstItem = allNodes[j]
    const secondItem = allNodes[j + 1]

    console.log("pass", j, " ", allNodes)

    if (firstItem.value > secondItem.value) {
      console.log(j)
      yield* swapNodes(j, j + 1, allNodes)
    }
  }
}

export default makeScene2D(function* (view) {
  const rects: TRect[] = []

  const sceneWidth = useScene2D().getSize().x
  const sceeneHeight = useScene2D().getSize().y

  const INITIAL_X = -sceneWidth / 3

  for (let i = 0; i < 5; i++) {
    rects.push({
      rect: createRef<Rect>(),
      x: INITIAL_X,
      y: i * RECT_HEIGHT + i * GAP,
      value: getRandomInt(10, 100),
    })
  }

  view.add(
    <>
      {rects.map(({ rect, x, y, value }) => {
        return (
          <Rect
            ref={rect}
            position={[x, y]}
            width={RECT_WIDTH}
            height={RECT_HEIGHT}
            fill="#ff6470"
            radius={5}
          >
            <Text fill={"white"} fontSize={30}>
              {String(value)}
            </Text>
          </Rect>
        )
      })}
    </>
  )

  rects.forEach((_, index) => {
    rects[index].x = index * RECT_WIDTH + index * GAP - sceneWidth / 8
    rects[index].y = 0
  })

  const anims = rects.map(({ rect, x, y }) => {
    return rect().position([x, y], 1)
  })

  yield* all(...anims)

  console.table(rects)

  // yield* bubbleSort(rects)

  // yield* swapNodes(0, 1, rects)

  // yield* swapNodes(1, 2, rects)

  yield* swapNodes(2, 3, rects)

  console.table(rects)

  yield* swapNodes(3, 4, rects)

  console.table(rects)
})
