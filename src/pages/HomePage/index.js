import React, { useState, useEffect, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  Box, Center, AlertDialog,
  View, Button, Input, Text, Flex, useToast,
} from "native-base";
import * as Clipboard from 'expo-clipboard';
import { AntDesign } from '@expo/vector-icons'; 
import DraggableFlatList from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import moment from 'moment';


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

  const addLink = async () => {
    let list = linkList;
    let inputUrl = url;
    inputUrl = inputUrl.toLowerCase();
    if (!/^(https?:\/\/).*/.test(inputUrl)) {
      toast.show({
        title: "url 형식이 아닙니다",
        status: "error",
        placement: "bottom",
        width: 700,
        mb: 100
      })
      return;
    }
      
    const item = [{
      id: `${moment().format('YYYY-MM-DD').replaceAll('-', '')}${Math.floor(Math.random() * 10000)}`,
      title: inputUrl,
      url: inputUrl,
      createdAt: moment(),
    }];

    try {
      setLinkList([...list, ...item])
      setUrl("")
      setAsyncStorageLinkList([...list, ...item])
    } catch (e) {
      // console.warning(e)
    }
  }

  const deleteUrl = () => {
    const filteredList = linkList.filter(item => item.id !== deleteId)
    setLinkList(filteredList);
    setDeleteId(null);
    setAsyncStorageLinkList(filteredList);
  }

  const chagneArrange = async (obj) => {
    setLinkList([...obj.data]);
    setAsyncStorageLinkList([...obj.data]);
  }

  const setAsyncStorageLinkList = async (list) => {
    await AsyncStorage.setItem('linkList', JSON.stringify(list));
  }

  const renderItem = useCallback(
    ({ item, index, drag, isActive }) => {
      return (
        <TouchableOpacity
          onLongPress={drag}
          onPress={() => Linking.openURL(item.url)}
        >
          <Box
            mb={2}
            p={4}
            width="100%"
            height="85px"
            rounded="md"
            border={1}
          >
            <Flex direction="row" justify="space-between">
              <Text style={{ fontSize: 20 }}>{item.url || "12314"}</Text>
              <Text style={{ fontSize: 20 }}>{moment(item.createdAt).format('YYYY-MM-DD')}</Text>
            </Flex>
            <Flex direction="row" justify="space-between" mt={1}>
              <Text style={{ fontSize: 20 }}>{item.url}</Text>
              <TouchableOpacity onPress={() => setDeleteId(item.id)}>
                <AntDesign name="delete" size={24} color="red"/>
              </TouchableOpacity>
            </Flex>
          </Box>
        </TouchableOpacity>
        );
    },
    []
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View p={4}>
        <View pb={5} style={{ height: '94%' }}>
          <DraggableFlatList
            data={[...linkList]}
            renderItem={renderItem}
            keyExtractor={(item, index) => `draggable-item-${index}`}
            onDragEnd={obj => chagneArrange(obj)}
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


