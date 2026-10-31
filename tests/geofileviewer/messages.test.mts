import { test } from "node:test"
import assert from "node:assert/strict"
import {
  dictionaries,
  getMessages
} from "../../.vitepress/theme/components/geofileviewer/messages.mts"

test("all supported locales cover the same UI messages and four presets", () => {
  const keys = (value: object) => Object.keys(value).sort()
  for (const dictionary of Object.values(dictionaries)) {
    assert.deepEqual(keys(dictionary), keys(dictionaries.zh))
    assert.deepEqual(keys(dictionary.errors), keys(dictionaries.zh.errors))
    assert.equal(dictionary.presetNames.length, 4)
    assert.equal(dictionary.presetDescriptions.length, 4)
  }
  assert.equal(getMessages("ru-RU"), dictionaries.ru)
  assert.equal(getMessages("zh-CN"), dictionaries.zh)
  assert.equal(getMessages("unknown"), dictionaries.en)
})
