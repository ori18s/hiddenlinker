import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  Box, Center, AlertDialog, Checkbox, Menu, Pressable,
  View, Button, Input, Text, Flex, useToast, HamburgerIcon,
} from "native-base";
import moment from 'moment';
import _ from 'lodash';
import * as Clipboard from 'expo-clipboard';
import { AntDesign } from '@expo/vector-icons'; 
import DraggableFlatList from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { getLinkPreview } from "link-preview-js";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

console.log(windowWidth)


const HomePage = () => {
  const [ linkList, setLinkList ] = useState([]);
  const [ deleteId, setDeleteId ] = useState(null);
  const [ url, setUrl ] = useState('');

  useEffect(() => {
    init();
  }, []);

  const toast = useToast();

  const init = async () => {
    try {
      const list = JSON.parse(await AsyncStorage.getItem('linkList') || []);
      const copiedText = await Clipboard.getStringAsync() || '';
      setLinkList(list);
      setUrl(copiedText);
    } catch(e) {
      // console.warning(e)
    }
  }

  /***
   * URL로부터 사이트 제목, 설명, url, 이미지 등을 가져옴
   * @param url
   * @returns {Promise<{url: string, title: string, description: string, images: string[], favicons: string[]}>}
   */
  const prefetch = async (url) => await getLinkPreview(url);

  const addLink = async () => {
    const list = linkList;
    if (!/^(https?:\/\/).*/i.test(url)) {
      toast.show({
        title: "url 형식이 아닙니다",
        status: "error",
        placement: "bottom",
        width: 700,
        mb: 100
      })
      return;
    }

    const {title, description, images, favicons} = await prefetch(url);
    const inputUrl = url.toLowerCase();

    const item = [{
      id: `${moment().format('YYYY-MM-DD').replaceAll('-', '')}${Math.floor(Math.random() * 10000)}`,
      image: images.length ? images[0] : favicons.length ? favicons : null,
      title: title ?? "<타이틀을 입력해주세요>",
      description: description ?? "",
      url: inputUrl.toLowerCase(),
      createdAt: moment(),
      checked: false,
    }];

    try {
      setUrl("")
      setLinkData([...list, ...item])
    } catch (e) {
      // console.warning(e)
    }
  }

  const deleteUrl = async () => {
    const filteredList = linkList.filter(item => item.id !== deleteId)
    setDeleteId(null);
    setLinkData(filteredList)
  }

  const setCheckBox = async (id, checked) => {
    linkList.map(item => {
      if (item.id === id) {
        item.checked = checked;
        return;
      }
    })
    setLinkData(linkList)
  }

  const setLinkData = async (arr) => {
    setLinkList([...arr]);
    await AsyncStorage.setItem('linkList', JSON.stringify(arr));
  }

  const renderItem = useCallback(
    ({ item, index, drag, isActive }) => {
      return (
        <TouchableOpacity
          onLongPress={drag}
          onPress={async () => {
            await Linking.openURL(item.url)
          }}
          key={index}
        >
          <Box
            mb={2}
            p={4}
            width="100%"
            height="85px"
            rounded="md"
            border={1}
          >
            <Flex direction="row" >
              <Box mr={2} style={{ justifyContent: "center" }}>
                <Checkbox
                  colorScheme="green"
                  value="green"
                  size="sm"
                  isChecked={item.checked}
                  onChange={(value) => setCheckBox(item.id, value)}
                />
              </Box>
              <Box>
                <Flex direction="row" justify="space-between">
                  {/* <Image source={{uri: item.image}} style={{width: 30, height: 30}}/> */}
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontSize: 20, width: 80 }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontSize: 12, marginLeft: 1, marginTop: 5, width: windowWidth - 280 }}
                  >
                      {item.description}
                    </Text>
                  <Text mr={2} style={{ fontSize: 20, width: 120 }}>{moment(item.createdAt).format('YYYY-MM-DD')}</Text>
                </Flex>
                <Flex direction="row" justify="space-between" mt={1}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontSize: 20, width: windowWidth - 120 }}
                  >
                    {item.url}
                  </Text>
                  {/* <Box mr={5}>
                    <Menu
                      trigger={(triggerProps) => {
                        return (
                          <Pressable accessibilityLabel="More options menu" {...triggerProps}>
                            <HamburgerIcon />
                          </Pressable>
                        )
                      }}
                    >
                      <Menu.Item onPress={() => console.log("Arial")}>
                        <AntDesign name="delete" size={24} color="red"/>
                      </Menu.Item>
                    </Menu>
                  </Box> */}
                  <TouchableOpacity style={{ marginRight: 20, marginTop: 5 }} onPress={() => setDeleteId(item.id)}>
                    <AntDesign name="delete" size={24} color="red"/>
                  </TouchableOpacity>
                </Flex>
              </Box>
            </Flex>
          </Box>
        </TouchableOpacity>
        );
    }
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View p={4}>
        <View pb={5} style={{ height: '94%' }}>
          <DraggableFlatList
            data={[...linkList]}
            renderItem={renderItem}
            keyExtractor={(item, index) => `draggable-item-${index}`}
            onDragEnd={obj => setLinkData([...obj.data])}
          />
        </View>
        <Input
          type="text"
          InputRightElement={
            <Button ml={1} roundedLeft={0} roundedRight="md" onPress={addLink}>
              enter
            </Button>
          }
          bg="#ffffff"
          placeholder="input"
          value={url}
          onChangeText={val => setUrl(val)}
        />
        <Center>
          <AlertDialog
            motionPreset="fade"
            onClose={() => setDeleteId(null)}
            isOpen={!!deleteId}
            isCentered
          >
            <AlertDialog.Content>
              <AlertDialog.CloseButton />
              <AlertDialog.Header>Delete url</AlertDialog.Header>
              <AlertDialog.Body>
                삭제하시겠습니까?
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <TouchableOpacity
                  style={{ marginBottom: 10 }}
                  onPress={() => deleteUrl()}>
                  <Text fontSize={20} style={{ color: 'red' }}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: 10, marginRight: 10 }}
                  onPress={() => setDeleteId(null)}>
                  <Text fontSize={20}>No</Text>
                </TouchableOpacity>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </Center>
      </View>
    </SafeAreaView>
  );
  
};

export default HomePage;


const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 300,
    marginTop: 16,
  },
});


