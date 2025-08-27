import { StatusBar } from 'expo-status-bar';
import { Alert, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]); // Estado para armazenar a lista de tarefas
  const [newTask, setNewTask] = useState(''); // Estado para o texto da nova tarefa
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado para alternar entre os temas (dark/light)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks'); // Verifica se existe algo salvo
        savedTasks && setTasks(JSON.parse(savedTasks)); // Se a variável existir, faz o JSON
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error); // Erro porque não existem tarefas salvas
      }
    };
    loadTasks();
  }, []); // Ação de pause

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Erro ao salvar tarefas:', error);
      }
    };

    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim().length > 0) {
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: Date.now().toString(), text: newTask.trim(), completed: false }, // Cria uma nova tarefa com ID único
      ]);
      setNewTask(''); // Limpa o campo de input
      Keyboard.dismiss(); // Fecha o teclado do usuário
    } else {
      Alert.alert('Atenção', 'Por favor, digite uma tarefa.');
    }
  };

  const toggleTaskCompleted = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    Alert.alert('Confirmar exclusão', 'Tem certeza que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)),
      },
    ]);
  };

  const renderList = ({ item }) => (
    <View
      style={[
        styles.taskItem,
        isDarkMode && { backgroundColor: '#333', borderColor: '#555' } 
        // Se o dark mode estiver ativo, muda cor de fundo e borda da task
      ]}
      key={item.id}
    >
      <TouchableOpacity
        onPress={() => toggleTaskCompleted(item.id)}
        style={styles.taskTextContainer}
      >
        <Text
          style={[
            styles.taskText,
            item.completed && styles.completedTaskItem,
            isDarkMode && { color: '#ccc' } // No dark mode, muda a cor do texto da tarefa para cinza claro
          ]}
        >
          {item.text}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={[styles.taskText, isDarkMode && { color: '#ccc' }]}>🗑️</Text>
        {/* No dark mode, o ícone de excluir muda para cinza claro */}
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? { backgroundColor: '#121212' } : { backgroundColor: '#e0f7fa' } 
        // Fundo principal: escuro no dark mode, azul claro no light mode
      ]}
    >
      <View
        style={[
          styles.topBar,
          isDarkMode && { backgroundColor: '#1e1e1e', borderBottomColor: '#333' } 
          // Barra superior fica escura no dark mode
        ]}
      >
        <Text
          style={[
            styles.topBarTitle,
            isDarkMode && { color: '#fff' } // Texto do título fica branco no dark mode
          ]}
        >
          Minhas Tarefas
        </Text>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
          <Text>{isDarkMode ? '🌞' : '🌛'}</Text>
          {/* Botão que alterna: mostra sol no dark mode, lua no light mode */}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, isDarkMode && { backgroundColor: '#1e1e1e' }]}>
        {/* Card de adicionar tarefa: fundo escuro no dark mode */}
        <TextInput
          style={[
            styles.input,
            isDarkMode && { backgroundColor: '#333', color: '#fff', borderColor: '#555' } 
            // Input no dark mode: fundo cinza escuro, texto branco, borda cinza
          ]}
          placeholder="Adicionar nova tarefa..."
          placeholderTextColor={isDarkMode ? '#888' : '#333'} 
          // Placeholder: cinza no dark mode, preto no light mode
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            isDarkMode && { backgroundColor: '#00796b' } 
            // Botão "Adicionar" muda para verde escuro no dark mode
          ]}
          onPress={addTask}
        >
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.flatList}
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderList}
        ListEmptyComponent={() => (
          <Text
            style={[
              styles.emptyListText,
              isDarkMode && { color: '#888' } // Texto da lista vazia fica cinza no dark mode
            ]}
          >
            Nenhuma tarefa adicionada ainda.
          </Text>
        )}
        contentContainerStyle={styles.flatListContent}
      />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} /> 
      {/* A StatusBar acompanha o tema: clara no dark mode, escura no light mode */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0f7fa',
    flex: 1,
  },
  topBar: {
    backgroundColor: '#fff',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  topBarTitle:{
    color: "#00796b",
    fontSize: 24,
    fontWeight: "bold",
  },
  card:{
    backgroundColor: "#fff",
    color: "#000",
    shadowColor: "#000",
    margin: 20,
    borderRadius: 15,
    padding:20,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  input:{
    backgroundColor: "#fcfcfc",
    color: "#333",
    borderColor: "#b0bec5",
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
    fontSize: 18,
    marginBottom: 10,
  },
  addButton:{
    backgroundColor: "#009688",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText:{
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  flatListContent:{
    paddingBottom: 10, //espaçamento no final da lista 
  },
  taskItem:{
    backgroundColor: "#fff",
    color: "#333",
    borderColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
  },
  taskTextContainer:{
    flex: 1, //permite que o texto ocupe o espaço disponível
    marginRight: 10,
  },
  taskText:{
    color: "#333",
    fontSize: 18,
    flexWrap: "wrap", //permite que o texto quebre linha
  },
  completedTaskItem:{
    textDecorationLine: "line-through", //risca o texto
    opacity: 0.6,
  },
  deleteButton:{
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText:{
    // color: "#fff",
    fontSize:22,
    fontWeight: "bold",
  },
  emptyListText: {
    color: "#9e9e9e",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },

});
